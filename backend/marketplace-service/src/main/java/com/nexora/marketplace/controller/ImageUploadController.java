package com.nexora.marketplace.controller;

import com.nexora.marketplace.dto.ImageUploadResponseDto;
import com.nexora.marketplace.service.ImageStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/marketplace/uploads")
@RequiredArgsConstructor
public class ImageUploadController {

    private final ImageStorageService imageStorageService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ImageUploadResponseDto> upload(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(imageStorageService.store(file));
    }

    @GetMapping("/{filename}")
    public ResponseEntity<Resource> get(@PathVariable String filename) {
        Resource resource = imageStorageService.loadAsResource(filename);
        MediaType mediaType = imageStorageService.mediaTypeFor(filename);
        return ResponseEntity.ok()
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=31536000")
                .contentType(mediaType)
                .body(resource);
    }
}
