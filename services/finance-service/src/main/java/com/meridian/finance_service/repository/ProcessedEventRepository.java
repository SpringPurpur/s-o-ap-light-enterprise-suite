package com.meridian.finance_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.meridian.finance_service.domain.ProcessedEvent;

public interface ProcessedEventRepository extends JpaRepository<ProcessedEvent, String> { }
