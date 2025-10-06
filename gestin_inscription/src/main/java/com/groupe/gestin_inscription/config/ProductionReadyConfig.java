package com.groupe.gestin_inscription.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
@EnableScheduling
public class ProductionReadyConfig {

    @Value("${app.storage.secure-path:/var/sigec/secure-storage}")
    private String secureStoragePath;

    @Value("${app.ocr.enabled:false}")
    private boolean ocrEnabled;

    @Value("${app.face-detection.enabled:false}")
    private boolean faceDetectionEnabled;

    @Bean
    public Path secureStoragePath() {
        return Paths.get(secureStoragePath);
    }

    @Bean
    @Profile("!test")
    public DocumentValidationConfig documentValidationConfig() {
        return DocumentValidationConfig.builder()
                .ocrEnabled(ocrEnabled)
                .faceDetectionEnabled(faceDetectionEnabled)
                .maxFileSize(5 * 1024 * 1024L) // 5MB
                .allowedImageFormats(new String[]{"jpg", "jpeg", "png", "jfif"})
                .allowedDocumentFormats(new String[]{"pdf"})
                .build();
    }

    public static class DocumentValidationConfig {
        private final boolean ocrEnabled;
        private final boolean faceDetectionEnabled;
        private final long maxFileSize;
        private final String[] allowedImageFormats;
        private final String[] allowedDocumentFormats;

        private DocumentValidationConfig(Builder builder) {
            this.ocrEnabled = builder.ocrEnabled;
            this.faceDetectionEnabled = builder.faceDetectionEnabled;
            this.maxFileSize = builder.maxFileSize;
            this.allowedImageFormats = builder.allowedImageFormats;
            this.allowedDocumentFormats = builder.allowedDocumentFormats;
        }

        public static Builder builder() {
            return new Builder();
        }

        public static class Builder {
            private boolean ocrEnabled;
            private boolean faceDetectionEnabled;
            private long maxFileSize;
            private String[] allowedImageFormats;
            private String[] allowedDocumentFormats;

            public Builder ocrEnabled(boolean ocrEnabled) {
                this.ocrEnabled = ocrEnabled;
                return this;
            }

            public Builder faceDetectionEnabled(boolean faceDetectionEnabled) {
                this.faceDetectionEnabled = faceDetectionEnabled;
                return this;
            }

            public Builder maxFileSize(long maxFileSize) {
                this.maxFileSize = maxFileSize;
                return this;
            }

            public Builder allowedImageFormats(String[] allowedImageFormats) {
                this.allowedImageFormats = allowedImageFormats;
                return this;
            }

            public Builder allowedDocumentFormats(String[] allowedDocumentFormats) {
                this.allowedDocumentFormats = allowedDocumentFormats;
                return this;
            }

            public DocumentValidationConfig build() {
                return new DocumentValidationConfig(this);
            }
        }

        // Getters
        public boolean isOcrEnabled() { return ocrEnabled; }
        public boolean isFaceDetectionEnabled() { return faceDetectionEnabled; }
        public long getMaxFileSize() { return maxFileSize; }
        public String[] getAllowedImageFormats() { return allowedImageFormats; }
        public String[] getAllowedDocumentFormats() { return allowedDocumentFormats; }
    }
}