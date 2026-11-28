package com.kix.domain.product.dto;

import com.kix.domain.product.entity.Product;
import com.kix.domain.product.entity.ProductOption;
import com.kix.domain.product.entity.ProductStatus;

import java.util.List;

public record ProductDetailResponse(
        Long id,
        Long brandId,
        String brandName,
        String name,
        int price,
        String description,
        String imageUrl,
        ProductStatus status,
        boolean soldOut,
        List<ProductOptionResponse> options) {

    public static ProductDetailResponse from(
            Product product, List<ProductOption> options, boolean soldOut) {
        return new ProductDetailResponse(
                product.getId(),
                product.getBrand().getId(),
                product.getBrand().getName(),
                product.getName(),
                product.getPrice(),
                product.getDescription(),
                product.getImageUrl(),
                product.getStatus(),
                soldOut,
                options.stream().map(ProductOptionResponse::from).toList());
    }
}
