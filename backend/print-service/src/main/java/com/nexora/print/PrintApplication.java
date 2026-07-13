package com.nexora.print;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {"com.nexora.print", "com.nexora.common"})
public class PrintApplication {
    public static void main(String[] args) {
        SpringApplication.run(PrintApplication.class, args);
    }
}
