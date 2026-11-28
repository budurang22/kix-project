package com.kix.domain.product.dto;

import com.kix.domain.product.entity.ProductOption;

public record ProductOptionResponse(Long id, int sizeMn, int stock) {

    public static ProductOptionResponse from(ProductOption productOption) {
        return new ProductOptionResponse(productOption.getId(), productOption.getSizeMm(), productOption.getStock());
    }
    
}
