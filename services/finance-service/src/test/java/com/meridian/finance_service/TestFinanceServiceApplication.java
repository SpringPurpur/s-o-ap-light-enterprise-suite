package com.meridian.finance_service;

import org.springframework.boot.SpringApplication;

public class TestFinanceServiceApplication {

	public static void main(String[] args) {
		SpringApplication.from(FinanceServiceApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}
