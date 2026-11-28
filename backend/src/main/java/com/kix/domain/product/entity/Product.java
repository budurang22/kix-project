package com.kix.domain.product.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "products")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "brand_id")
    private Brand brand;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false)
    private int price;

    private String description;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private ProductStatus status;

    @Column(name = "is_deleted", nullable = false)
    private boolean deleted;

    public Product(Brand brand, String name, int price, String description, String imageUrl) {
        this.brand = brand;
        this.name = name;
        this.price = price;
        this.description = description;
        this.imageUrl = imageUrl;
        this.status = ProductStatus.ON_SALE;
        this.deleted = false;
    }

    public boolean isOrderable() {
        return status == ProductStatus.ON_SALE && !deleted;
    }
}
