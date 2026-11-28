package com.kix.domain.order.entity;

import com.kix.domain.member.entity.Member;
import com.kix.domain.product.entity.Brand;
import com.kix.domain.product.entity.Product;
import com.kix.domain.product.entity.ProductOption;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

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
}
