package com.kix.domain.order.entity;

import com.kix.domain.member.entity.Member;
import com.kix.domain.product.entity.Brand;
import com.kix.domain.product.entity.Product;
import com.kix.domain.product.entity.ProductOption;
import com.kix.domain.product.entity.ProductStatus;
import com.kix.domain.product.exception.InsufficientStockException;
import com.kix.domain.product.exception.ProductNotAvailableException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.assertj.core.api.AssertionsForClassTypes.assertThatThrownBy;

public class OrderTest {

    @Test
    @DisplayName("주문을 만들면 주문 당시의 상품명/사이즈/단가가 저장되고 총액은 단가*수량")
    void createSnapShot() {
        // given
        Product product = new Product(new Brand("Nike"), "덩크 로우", 139000, null, null);

        ProductOption option = new ProductOption(product, 270, 5);
        Member member = new Member("buyer@kix.com", "hashed", "구매자");

        // when
        Order order = Order.create(member, option, 2, "key-0123456789abcdef");

        // then
        assertThat(order.getProductName()).isEqualTo("덩크 로우");
        assertThat(order.getSizeMm()).isEqualTo(270);
        assertThat(order.getQuantity()).isEqualTo(2);
        assertThat(order.getUnitPrice()).isEqualTo(139000);
        assertThat(order.getTotalPrice()).isEqualTo(278000L);
        assertThat(order.getStatus()).isEqualTo(OrderStatus.ORDERED);
    }

    @Test
    @DisplayName("수량이 1 미만이면 주문을 만들 수 없다")
    void quantityLessThanOne() {
        // given
        Product product = new Product(new Brand("Nike"), "덩크 로우", 139000, null, null);
        ProductOption option = new ProductOption(product, 270, 5);
        Member member = new Member("buyer@kix.com", "hashed", "구매자");

        // when & then
        assertThatThrownBy(() -> Order.create(member, option, 0, "key-0123456789abcdef"))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> Order.create(member, option, -1, "key-0123456789abcdef"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("판매 중지 상품은 주문 할 수 없다")
    void stoppedProduct() {
        // given
        Product product = new Product(new Brand("Nike"), "덩크 로우", 139000, null, null);
        ReflectionTestUtils.setField(product, "status", ProductStatus.STOPPED);
        ProductOption option = new ProductOption(product, 270, 5);
        Member member = new Member("buyer@kix.com", "hashed", "구매자");

        // when & then
        assertThatThrownBy(() -> Order.create(member, option, 1, "key-0123456789abcdef"))
                .isInstanceOf(ProductNotAvailableException.class);
    }

    @Test
    @DisplayName("삭제된 상품은 주문할 수 없다")
    void deletedProduct() {
        // given
        Product product = new Product(new Brand("Nike"), "덩크 로우", 139000, null, null);
        ReflectionTestUtils.setField(product, "deleted", true);
        ProductOption option = new ProductOption(product, 270, 5);
        Member member = new Member("buyer@kix.com", "hashed", "구매자");

        // when & then
        assertThatThrownBy(() -> Order.create(member, option, 1, "key-0123456789abcdef"))
                .isInstanceOf(ProductNotAvailableException.class);
    }

    @Test
    @DisplayName("총액이 int 범위를 넘어도 정확하게 계산한다")
    void totalPriceOverInt() {
        // given
        Product product = new Product(new Brand("Nike"), "고가 상품", 2_000_000_000, null, null);
        ProductOption option = new ProductOption(product, 270, 5);
        Member member = new Member("buyer@kix.com", "hashed", "구매자");

        // when
        Order order = Order.create(member, option, 2, "key-0123456789abcdef");

        // then
        assertThat(order.getTotalPrice()).isEqualTo(4_000_000_000L);
    }

    @Test
    @DisplayName("주문을 만들면 옵션 재고가 주문 수량만큼 줄어든다")
    void decreaseStockOnCreate() {
        // given
        Product product = new Product(new Brand("Nike"), "덩크 로우", 139000, null, null);
        ProductOption option = new ProductOption(product, 270, 5);
        Member member = new Member("buyer@kix.com", "hashed", "구매자");

        // when
        Order.create(member, option, 2, "key-0123456789abcdef");

        // then
        assertThat(option.getStock()).isEqualTo(3);
    }

    @Test
    @DisplayName("재고가 부족하면 주문을 만들 수 없고 재고는 그대로다")
    void insufficientStock() {
        // given
        Product product = new Product(new Brand("Nike"), "덩크 로우", 139000, null, null);
        ProductOption option = new ProductOption(product, 270, 1);
        Member member = new Member("buyer@kix.com", "hashed", "구매자");

        // when & then
        assertThatThrownBy(() -> Order.create(member, option, 2, "key-0123456789abcdef"))
                .isInstanceOf(InsufficientStockException.class);
        assertThat(option.getStock()).isEqualTo(1);
    }
}
