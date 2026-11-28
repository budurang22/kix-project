package com.kix.domain.product.repository;

import com.kix.domain.product.entity.ProductOption;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface ProductOptionRepository extends JpaRepository<ProductOption, Long> {
    List<ProductOption> findByProductId(Long productId);

    List<ProductOption> findByProductIdIn(Collection<Long> productIds);
}
