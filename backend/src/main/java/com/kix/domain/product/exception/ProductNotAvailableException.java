package com.kix.domain.product.exception;

public class ProductNotAvailableException extends RuntimeException {

    public ProductNotAvailableException() {
        super("현재 주문 할 수 없는 상품입니다.");
    }
}
