package com.kix.domain.product.exception;

public class ProductOptionNotFoundException extends RuntimeException {

    public ProductOptionNotFoundException() {
        super("상품 옵션을 찾을 수 없습니다.");
    }
}
