package com.example.demo;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class HelloController {

    @GetMapping("/hello")
    public Map<String, Object> getHello() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Hello from Spring Boot Backend!");
        response.put("timestamp", System.currentTimeMillis());
        response.put("frameworks", new String[]{"React Native", "Expo", "Spring Boot"});
        return response;
    }

    @GetMapping("/hello/student")
    @PreAuthorize("hasRole('STUDENT')")
    public Map<String, Object> getStudentHello() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Hello, Authorized Student!");
        response.put("timestamp", System.currentTimeMillis());
        return response;
    }

    @GetMapping("/hello/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> getAdminHello() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Hello, Authorized Admin!");
        response.put("timestamp", System.currentTimeMillis());
        return response;
    }
}
