package com.nexora.marketplace.service;

import com.nexora.common.exception.NexoraException;
import com.nexora.common.exception.ResourceNotFoundException;
import com.nexora.marketplace.dto.ImageUploadResponseDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class ImageStorageService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
            "image/gif"
    );

    private static final long MAX_BYTES = 8 * 1024 * 1024; // 8 MB

    @Value("${nexora.marketplace.upload-dir:uploads}")
    private String uploadDir;

    private Path root;

    @PostConstruct
    void init() throws IOException {
        root = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(root);
    }

    public ImageUploadResponseDto store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new NexoraException("Please choose a photo to upload");
        }
        if (file.getSize() > MAX_BYTES) {
            throw new NexoraException("Photo must be 8 MB or smaller");
        }

        String contentType = file.getContentType() != null ? file.getContentType().toLowerCase(Locale.ROOT) : "";
        if (!ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new NexoraException("Only JPEG, PNG, WebP, or GIF photos are allowed");
        }

        String extension = extensionFor(contentType, file.getOriginalFilename());
        String filename = UUID.randomUUID() + extension;

        try {
            Path target = root.resolve(filename).normalize();
            if (!target.startsWith(root)) {
                throw new NexoraException("Invalid upload path");
            }
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new NexoraException("Could not save the photo", e);
        }

        return ImageUploadResponseDto.builder()
                .filename(filename)
                .url("/api/marketplace/uploads/" + filename)
                .build();
    }

    public Resource loadAsResource(String filename) {
        try {
            Path file = root.resolve(filename).normalize();
            if (!file.startsWith(root) || !Files.exists(file) || !Files.isRegularFile(file)) {
                throw new ResourceNotFoundException("Photo not found");
            }
            Resource resource = new UrlResource(file.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new ResourceNotFoundException("Photo not found");
            }
            return resource;
        } catch (MalformedURLException e) {
            throw new ResourceNotFoundException("Photo not found");
        }
    }

    public MediaType mediaTypeFor(String filename) {
        String lower = filename.toLowerCase(Locale.ROOT);
        if (lower.endsWith(".png")) return MediaType.IMAGE_PNG;
        if (lower.endsWith(".gif")) return MediaType.IMAGE_GIF;
        if (lower.endsWith(".webp")) return MediaType.parseMediaType("image/webp");
        return MediaType.IMAGE_JPEG;
    }

    private static String extensionFor(String contentType, String originalFilename) {
        return switch (contentType) {
            case "image/png" -> ".png";
            case "image/gif" -> ".gif";
            case "image/webp" -> ".webp";
            default -> {
                if (originalFilename != null) {
                    String name = originalFilename.toLowerCase(Locale.ROOT);
                    if (name.endsWith(".png")) yield ".png";
                    if (name.endsWith(".gif")) yield ".gif";
                    if (name.endsWith(".webp")) yield ".webp";
                }
                yield ".jpg";
            }
        };
    }
}
