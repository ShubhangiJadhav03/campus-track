package com.college.complaints.config;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.multipart.MultipartResolver;
import org.springframework.web.multipart.support.StandardServletMultipartResolver;

@Configuration
public class AppConfig {

    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    @Bean
    public ModelMapper modelMapper() {
        ModelMapper mapper = new ModelMapper();
        mapper.getConfiguration()
              .setSkipNullEnabled(true)
              .setAmbiguityIgnored(true);
        return mapper;
    }

    public String getUploadDir() {
        return uploadDir;
    }
}
