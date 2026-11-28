package com.kix.domain.order.entity;

import com.kix.domain.member.entity.Member;
import com.kix.domain.product.entity.Product;
import com.kix.domain.product.entity.ProductOption;
import com.kix.domain.product.exception.ProductNotAvailableException;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Entity
@Table(name = "orders")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_number", nullable = false, length = 32)
    private String orderNumber;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "member_id")
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_option_id")
    private ProductOption productOption;

    @Column(name = "product_name", nullable = false, length = 200)
    private String productName;

    @Column(name = "size_mm", nullable = false)
    private int sizeMm;

    @Column(nullable = false)
    private int quantity;

    @Column(name = "unit_price", nullable = false)
    private int unitPrice;

    @Column(name = "total_price", nullable = false)
    private long totalPrice;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    private OrderStatus status;

    @Column(name = "idempotency_key", nullable = false, length = 64)
    private String idempotencyKey;

    public static Order create(Member member, ProductOption productOption, int quantity, String idempotencyKey) {

        if (quantity < 1) {
            throw new IllegalArgumentException("수량은 1 이상이어야 합니다.");
        }

        Product product = productOption.getProduct();

        if (!product.isOrderable()) throw new ProductNotAvailableException();

        // NOTE: 옵션 재고도 함께 차감한다
        productOption.decreaseStock(quantity);

        Order order = new Order();
        order.member = member;
        order.productOption = productOption;
        order.productName = product.getName();
        order.orderNumber = generateOrderNumber();
        order.sizeMm = productOption.getSizeMm();
        order.quantity = quantity;
        order.unitPrice = product.getPrice();
        order.totalPrice = (long) product.getPrice() * quantity;
        order.status = OrderStatus.ORDERED;
        order.idempotencyKey = idempotencyKey;
        return order;
    }

    private static String generateOrderNumber() {
        String date = LocalDate.now(ZoneId.of("Asia/Seoul")).format(DateTimeFormatter.BASIC_ISO_DATE);
        String random = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        return "ORD-" + date + "-" + random;
    }
}
