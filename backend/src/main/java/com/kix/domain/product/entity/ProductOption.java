package com.kix.domain.product.entity;

import com.kix.domain.product.exception.InsufficientStockException;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "product_options")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProductOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "size_mm", nullable = false)
    private int sizeMm;

    @Column(nullable = false)
    private int stock;

    public ProductOption(int sizeMm, int stock) {
        this.sizeMm = sizeMm;
        this.stock = stock;
    }

    public void decreaseStock(int quantity) {
        if (quantity < 1) {
            throw new IllegalArgumentException("수량은 1 이상이어야 합니다.");
        }

        if (stock < quantity) {
            throw new InsufficientStockException("재고가 부족합니다. 재고=" + stock + ", 요청=" + quantity);
        }
        stock -= quantity;
    }
}
