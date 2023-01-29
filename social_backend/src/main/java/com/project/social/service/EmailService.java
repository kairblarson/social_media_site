package com.project.social.service;

import com.project.social.entity.VerificationToken;
import com.project.social.model.UserModel;
import com.project.social.repo.VerificationTokenRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpServletRequest;
import java.util.Date;
import java.util.UUID;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;
    @Autowired
    private VerificationTokenRepo verificationTokenRepo;

    public String sendEmail(UserModel userModel, HttpServletRequest request) {

        VerificationToken verificationToken = new VerificationToken();
        verificationToken.setUserEmail(userModel.getEmail());
        verificationToken.setToken(UUID.randomUUID().toString());
        verificationTokenRepo.save(verificationToken);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(userModel.getEmail());
        message.setFrom("test.email.forspring@gmail.com");
        message.setSubject("Click the link to verify your Termite account");
        message.setSentDate(new Date());
        message.setText(buildVerificationURL(request, verificationToken.getToken()));

        mailSender.send(message);

        return "Success";
    }

    public String buildVerificationURL(HttpServletRequest request, String token) {

        String confirmationURL = "http://"+request.getServerName()+":"+request.getServerPort()+"/"+request.getContextPath()+"verify-email?token="+token;

        return confirmationURL;
    }
}
