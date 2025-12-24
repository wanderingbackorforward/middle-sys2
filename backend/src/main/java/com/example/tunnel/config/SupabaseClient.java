package com.example.tunnel.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@Component
public class SupabaseClient {
    private final String baseUrl;
    private final String serviceKey;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    public SupabaseClient(
            @Value("${SUPABASE_URL}") String supabaseUrl,
            @Value("${SUPABASE_SERVICE_KEY:}") String serviceKey
    ) {
        this.baseUrl = supabaseUrl.endsWith("/") ? supabaseUrl + "rest/v1" : supabaseUrl + "/rest/v1";
        this.serviceKey = serviceKey;
        try {
            com.fasterxml.jackson.datatype.jsr310.JavaTimeModule timeModule = new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule();
            mapper.registerModule(timeModule);
            mapper.findAndRegisterModules();
        } catch (Exception ignored) {}
    }

    private HttpHeaders headers() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));
        if (serviceKey != null && !serviceKey.isEmpty()) {
            headers.set("apikey", serviceKey);
            headers.setBearerAuth(serviceKey);
        }
        return headers;
    }

    public <T> List<T> fetchList(String table, Map<String, String> query, TypeReference<List<T>> type) {
        StringBuilder url = new StringBuilder(baseUrl + "/" + table + "?");
        if (query != null) {
            query.forEach((k, v) -> {
                url.append(URLEncoder.encode(k, StandardCharsets.UTF_8)).append("=")
                        .append(URLEncoder.encode(v, StandardCharsets.UTF_8)).append("&");
            });
        }
        HttpEntity<Void> entity = new HttpEntity<>(headers());
        String resp = restTemplate.exchange(url.toString(), HttpMethod.GET, entity, String.class).getBody();
        try {
            return mapper.readValue(resp, type);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
