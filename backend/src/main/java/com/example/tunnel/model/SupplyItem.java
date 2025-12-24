package com.example.tunnel.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class SupplyItem {
    @JsonProperty("category")
    private String category;
    @JsonProperty("quantity")
    private Integer quantity;
    public String getCategory() { return category; }
    public Integer getQuantity() { return quantity; }
}
