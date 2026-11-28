package com.kix.domain.order.exception;

public class IdempotencyKeyConflictException extends RuntimeException {

    public IdempotencyKeyConflictException() {
        super("같은 멱등성 키로 다른 내용의 주문이 이미 있습니다.");
    }
}
