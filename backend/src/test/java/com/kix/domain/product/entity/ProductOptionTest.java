package com.kix.domain.product.entity;

import com.kix.domain.product.exception.InsufficientStockException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.assertj.core.api.AssertionsForClassTypes.assertThatThrownBy;

public class ProductOptionTest {

    @Test
    @DisplayName("재고가 충분하면 수량만큼 재고가 줄어든다")
    void decreaseStock() {
        // given: 재고 10개인 옵션
        ProductOption productOption = new ProductOption(270, 10);

        // when: 3개를 차감
        productOption.decreaseStock(3);

        // then: 재고 7개
        assertThat(productOption.getStock()).isEqualTo(7);
    }

    @Test
    @DisplayName("재고와 같은 수량을 차감하면 재고가 0이 된다 (경계값)")
    void decreaseStockToZero() {
        ProductOption option = new ProductOption(270, 5);

        option.decreaseStock(5);

        assertThat(option.getStock()).isZero();
    }

    @Test
    @DisplayName("재고보다 많이 차감하면 재고 부족 예외가 발생하고 재고는 그대로다")
    void decreaseStockInsufficient() {
        ProductOption option = new ProductOption(270, 2);

        assertThatThrownBy(() -> option.decreaseStock(3))
                .isInstanceOf(InsufficientStockException.class);
        assertThat(option.getStock()).isEqualTo(2);
    }

    @ParameterizedTest
    @ValueSource(ints = {0, -1})
    @DisplayName("수량이 1 미만이면 예외가 발생한다")
    void decreaseStockInvalidQuantity(int quantity) {
        ProductOption option = new ProductOption(270, 10);

        assertThatThrownBy(() -> option.decreaseStock(quantity))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
