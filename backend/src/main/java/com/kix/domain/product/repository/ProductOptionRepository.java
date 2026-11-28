package com.kix.domain.product.repository;

import com.kix.domain.product.entity.ProductOption;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ProductOptionRepository extends JpaRepository<ProductOption, Long> {

    List<ProductOption> findByProductIdIn(Collection<Long> productIds);

    List<ProductOption> findByProductIdOrderBySizeMmAsc(Long productId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select o from ProductOption o where o.id = :id")
    Optional<ProductOption> findByIdForUpdate(@Param("id") Long id);
}
