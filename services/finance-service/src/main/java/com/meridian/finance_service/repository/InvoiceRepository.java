package com.meridian.finance_service.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.meridian.finance_service.domain.Invoice;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    
    @Override
    @EntityGraph(attributePaths = "lines")
    List<Invoice> findAll();

    @Override
    @EntityGraph(attributePaths = "lines")
    Optional<Invoice> findById(Long id);

    @EntityGraph(attributePaths = "lines")
    Optional<Invoice> findByOrderId(Long orderId);

    boolean existsByOrderId(Long orderId);
}
