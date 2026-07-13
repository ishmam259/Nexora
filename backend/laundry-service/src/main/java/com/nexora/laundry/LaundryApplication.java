package com.nexora.laundry;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {"com.nexora.laundry", "com.nexora.common"})
public class LaundryApplication {
    public static void main(String[] args) {
        SpringApplication.run(LaundryApplication.class, args);
    }
}
