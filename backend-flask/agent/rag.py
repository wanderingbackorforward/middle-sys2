"""
RAG 知识库模块 - 安全规范与案例检索

从 knowledge/ 目录动态加载 .txt/.md 文件
支持 Chroma 向量检索或关键词匹配降级
"""

import os
import glob
from pathlib import Path
from typing import List, Optional

from langchain_core.documents import Document


class KnowledgeBase:
    """
    知识库管理类
    
    支持两种模式:
    1. 向量检索模式 (需要 chromadb + embeddings)
    2. 关键词匹配模式 (降级方案)
    """
    
    # 知识库目录路径（相对于当前文件）
    KNOWLEDGE_DIR = os.path.join(os.path.dirname(__file__), "..", "knowledge")
    
    def __init__(self, persist_dir: str = None):
        self.persist_dir = persist_dir or os.path.join(
            self.KNOWLEDGE_DIR, "vector_db"
        )
        self._vectorstore = None
        self._documents = self._load_docs_from_directory()
    
    def _load_docs_from_directory(self) -> List[Document]:
        """
        从 knowledge/ 目录加载所有 .txt 和 .md 文件
        
        文件命名约定（可选）:
        - 文件名包含 'gas' -> category='gas'
        - 文件名包含 'personnel' -> category='personnel'
        - 文件名包含 'vehicle' -> category='vehicle'
        - 其他 -> category='general'
        """
        docs = []
        knowledge_path = Path(self.KNOWLEDGE_DIR)
        
        # 检查目录是否存在
        if not knowledge_path.exists():
            print(f"[KnowledgeBase] 警告: 知识库目录不存在: {knowledge_path}")
            print(f"[KnowledgeBase] 请创建目录并放入 .txt 或 .md 文件")
            return docs
        
        # 尝试使用 LangChain DirectoryLoader
        try:
            from langchain_community.document_loaders import DirectoryLoader, TextLoader
            
            # 加载 .txt 文件
            txt_loader = DirectoryLoader(
                str(knowledge_path),
                glob="**/*.txt",
                loader_cls=TextLoader,
                loader_kwargs={"encoding": "utf-8"},
                show_progress=False,
                use_multithreading=False
            )
            
            # 加载 .md 文件
            md_loader = DirectoryLoader(
                str(knowledge_path),
                glob="**/*.md",
                loader_cls=TextLoader,
                loader_kwargs={"encoding": "utf-8"},
                show_progress=False,
                use_multithreading=False
            )
            
            # 合并加载结果
            txt_docs = txt_loader.load()
            md_docs = md_loader.load()
            all_docs = txt_docs + md_docs
            
            # 为每个文档添加 category 元数据
            for doc in all_docs:
                source = doc.metadata.get("source", "").lower()
                doc.metadata["category"] = self._infer_category(source)
            
            docs.extend(all_docs)
            print(f"[KnowledgeBase] 成功加载 {len(docs)} 份文档 (DirectoryLoader)")
            
        except ImportError:
            print("[KnowledgeBase] DirectoryLoader 不可用，使用原生文件读取")
            docs = self._load_docs_native(knowledge_path)
        except Exception as e:
            print(f"[KnowledgeBase] DirectoryLoader 加载失败: {e}")
            print("[KnowledgeBase] 尝试使用原生文件读取...")
            docs = self._load_docs_native(knowledge_path)
        
        if not docs:
            print(f"[KnowledgeBase] 警告: 未找到任何文档，请在以下目录放入 .txt 或 .md 文件:")
            print(f"  {knowledge_path.absolute()}")
        
        return docs
    
    def _load_docs_native(self, knowledge_path: Path) -> List[Document]:
        """
        原生文件读取（不依赖 LangChain loaders）
        """
        docs = []
        
        # 查找所有 .txt 和 .md 文件
        patterns = ["**/*.txt", "**/*.md"]
        
        for pattern in patterns:
            for file_path in knowledge_path.glob(pattern):
                # 跳过 README 文件
                if file_path.name.lower() == "readme.md":
                    continue
                
                try:
                    content = file_path.read_text(encoding="utf-8")
                    if content.strip():  # 跳过空文件
                        doc = Document(
                            page_content=content,
                            metadata={
                                "source": str(file_path),
                                "filename": file_path.name,
                                "category": self._infer_category(file_path.name)
                            }
                        )
                        docs.append(doc)
                except Exception as e:
                    print(f"[KnowledgeBase] 读取文件失败 {file_path}: {e}")
        
        print(f"[KnowledgeBase] 成功加载 {len(docs)} 份文档 (原生读取)")
        return docs
    
    def _infer_category(self, filename: str) -> str:
        """
        根据文件名推断文档类别
        """
        filename_lower = filename.lower()
        
        if "gas" in filename_lower or "瓦斯" in filename_lower:
            return "gas"
        elif "personnel" in filename_lower or "人员" in filename_lower:
            return "personnel"
        elif "vehicle" in filename_lower or "车辆" in filename_lower:
            return "vehicle"
        else:
            return "general"
    
    def _init_vectorstore(self):
        """初始化向量存储（懒加载）"""
        if self._vectorstore is not None:
            return
        
        if not self._documents:
            print("[KnowledgeBase] 无文档可索引，跳过向量库初始化")
            return
        
        try:
            from langchain_community.vectorstores import Chroma
            from langchain_community.embeddings import HuggingFaceEmbeddings
            
            # 使用轻量级中文嵌入模型
            embeddings = HuggingFaceEmbeddings(
                model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
                model_kwargs={'device': 'cpu'}
            )
            
            self._vectorstore = Chroma.from_documents(
                documents=self._documents,
                embedding=embeddings,
                persist_directory=self.persist_dir
            )
        except ImportError:
            print("[KnowledgeBase] Warning: chromadb/embeddings not available, using keyword search")
            self._vectorstore = None
    
    def search(self, query: str, k: int = 3, category: str = None) -> List[Document]:
        """
        检索相关文档
        
        Args:
            query: 检索查询
            k: 返回文档数量
            category: 可选，筛选特定类别
        """
        # 尝试使用向量检索
        try:
            self._init_vectorstore()
            if self._vectorstore:
                if category:
                    results = self._vectorstore.similarity_search(
                        query, k=k,
                        filter={"category": category}
                    )
                else:
                    results = self._vectorstore.similarity_search(query, k=k)
                return results
        except Exception as e:
            print(f"[KnowledgeBase] Vector search failed: {e}")
        
        # 降级：关键词匹配
        return self._keyword_search(query, k, category)
    
    def _keyword_search(self, query: str, k: int, category: str = None) -> List[Document]:
        """关键词匹配（降级方案）"""
        results = []
        query_lower = query.lower()
        
        for doc in self._documents:
            # 类别过滤
            if category and doc.metadata.get("category") != category:
                continue
            
            # 简单关键词匹配
            content_lower = doc.page_content.lower()
            score = 0
            for word in query_lower.split():
                if word in content_lower:
                    score += 1
            
            if score > 0:
                doc.metadata["score"] = score
                results.append((score, doc))
        
        # 按匹配度排序
        results.sort(key=lambda x: x[0], reverse=True)
        return [doc for _, doc in results[:k]]
    
    def add_document(self, content: str, source: str, category: str, **metadata):
        """添加新文档到知识库"""
        doc = Document(
            page_content=content,
            metadata={"source": source, "category": category, **metadata}
        )
        self._documents.append(doc)
        
        # 如果向量库已初始化，也添加到向量库
        if self._vectorstore:
            self._vectorstore.add_documents([doc])
    
    def get_categories(self) -> List[str]:
        """获取所有文档类别"""
        categories = set()
        for doc in self._documents:
            cat = doc.metadata.get("category")
            if cat:
                categories.add(cat)
        return list(categories)
    
    def reload(self):
        """重新加载知识库文档"""
        self._documents = self._load_docs_from_directory()
        self._vectorstore = None  # 重置向量库，下次搜索时重建
        print(f"[KnowledgeBase] 重新加载完成，共 {len(self._documents)} 份文档")
