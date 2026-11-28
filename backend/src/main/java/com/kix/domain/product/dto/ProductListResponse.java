package com.kix.domain.product.dto;

import com.kix.domain.product.entity.Product;
import com.kix.domain.product.entity.ProductStatus;

public record ProductListResponse (
        Long id,
        Long brandId,
        String brandName,
        String name,
        int price,
        String imageUrl,
        ProductStatus status,
        boolean soldOut) {

    public static ProductListResponse from(Product product, boolean soldOut) {
        return new ProductListResponse(
                product.getId(),
                product.getBrand().getId(),
                product.getBrand().getName(),
                product.getName(),
                product.getPrice(),
                product.getImageUrl(),
                product.getStatus(),
                soldOut);
    }
}
