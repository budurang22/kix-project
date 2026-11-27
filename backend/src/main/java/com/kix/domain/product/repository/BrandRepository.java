package com.kix.domain.product.repository;

import com.kix.domain.product.entity.Brand;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BrandRepository extends JpaRepository<Brand, Long> {
}
