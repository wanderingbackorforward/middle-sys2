package com.example.tunnel;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class TunnelApplication {
	public static void main(String[] args) {
		SpringApplication.run(TunnelApplication.class, args);
	}
}
