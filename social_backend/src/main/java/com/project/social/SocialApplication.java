package com.project.social;

import com.project.social.entity.Post;
import com.project.social.entity.Repost;
import com.project.social.entity.User;
import com.project.social.provider.Provider;
import com.project.social.repo.PostRepo;
import com.project.social.repo.RepostRepo;
import com.project.social.repo.UserRepo;
import com.project.social.service.S3Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;
import java.util.Date;
import java.util.List;

@SpringBootApplication
public class SocialApplication {

	@Autowired
	private PasswordEncoder passwordEncoder;

	public static void main(String[] args) {

		SpringApplication.run(SocialApplication.class, args);

//		ApplicationContext context = SpringApplication.run(SocialApplication.class, args);
//
//		S3Service s3Service = context.getBean(S3Service.class);
//
//		System.out.println(s3Service.getImageFileNames());
	}

//	@Bean
//	CommandLineRunner commandLineRunner(UserRepo userRepo) {
//		return args -> {
//			User user = new User();
//			user.setBio("admin");
//			user.setEnabled(true);
//			user.setProvider(Provider.LOCAL);
//			user.setEmail("admin@gmail.com");
//			user.setFullName("admin");
//			user.setUsername("admin");
//			user.setPassword(passwordEncoder.encode("password"));
//			user.setRole("ROLE_ADMIN");
//			userRepo.save(user);
//		};
//	}

//	@Bean
//	CommandLineRunner commandLineRunner(PostRepo postRepo, RepostRepo repostRepo) {
//		return args -> {
//			postRepo.findAll().forEach(post -> {
//				post.setRepostedBy(null);
//				post.setReposted(false);
//				post.setReposts(0);
//				postRepo.save(post);
//			});
//			repostRepo.deleteAll();
//		};
//	}
	//if repost feature breaks again just run this code

	//this is the code that is responsible for cors config
	@Bean
	public CorsFilter corsFilter() {
		CorsConfiguration corsConfiguration = new CorsConfiguration();
		corsConfiguration.setAllowCredentials(true);
		corsConfiguration.setAllowedOrigins(Arrays.asList("http://localhost:3000", "https://socialmediasite-production.up.railway.app/", "https://tiresome-bead-production.up.railway.app/"));
		corsConfiguration.setAllowedHeaders(Arrays.asList("Origin","Access-Control-Allow-Origin",
				"Content-Type","Accept","Authorization","Origin,Accept","X-Requested-With",
				"Access-Control-Request-Method","Access-Control-Request-Headers"));
		corsConfiguration.setExposedHeaders(Arrays.asList("Origin","Content-Type","Accept","Authorization",
				"Access-Control-Allow-Origin","Access-Control-Allow-Origin","Access-Control-Allow-Credentials"));
		corsConfiguration.setAllowedMethods(Arrays.asList("GET","PUT","POST","DELETE","OPTIONS"));
		UrlBasedCorsConfigurationSource urlBasedCorsConfigurationSource = new UrlBasedCorsConfigurationSource();
		urlBasedCorsConfigurationSource.registerCorsConfiguration("/**", corsConfiguration);
		return new CorsFilter(urlBasedCorsConfigurationSource);

	}
}
