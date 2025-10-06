package com.groupe.gestin_inscription;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.retry.annotation.EnableRetry;

@SpringBootApplication
@EnableJpaAuditing
@EnableRetry
@OpenAPIDefinition(info = @Info(title = "OnlineRegistration API", version = "3.0", description = "Documentation OnlineRegistration API v1.0"))
public class GestinInscriptionApplication {

	public static void main(String[] args) {

		SpringApplication.run(GestinInscriptionApplication.class, args);
	}

}
