package com.project.social.service;

import com.amazonaws.auth.AWSCredentialsProvider;
import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.client.builder.AwsClientBuilder;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.*;
import com.project.social.entity.User;
import com.project.social.repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class S3Service {

    private final AmazonS3 space;

    @Autowired
    private UserRepo userRepo;

//    @Value("${digital-ocean.access-key}")
//    private String accessKey;
//
//    @Value("${digital-ocean.secret-key}")
//    private String secretKey;

    public S3Service() {
        AWSCredentialsProvider awsCredentialsProvider = new AWSStaticCredentialsProvider(
                new BasicAWSCredentials("DO008VAUXD7PPARHB3V8","WnK51UBKmCPrOqHqLUNnah1YJtCJBC2NvRuTqfJ06Fg")
        );

        space = AmazonS3ClientBuilder
                .standard()
                .withCredentials(awsCredentialsProvider)
                .withEndpointConfiguration(
                        new AwsClientBuilder.EndpointConfiguration("nyc3.digitaloceanspaces.com", "nyc3")
                )
                .build();

    }

    public List<String> getImageFileNames() {
        ListObjectsV2Result result = space.listObjectsV2("termitearchive");
        List<S3ObjectSummary> objects = result.getObjectSummaries();

        //this is returning a new List of keys from each s3 objects summary
        return objects.stream().map(S3ObjectSummary::getKey).collect(Collectors.toList());
    }

    //save file name to user as well
    public String uploadToSpace(MultipartFile file, String email) {
        System.out.println("CHECKPOINT 2: ");

        User user = userRepo.findByEmail(email);
        if(user == null) {
            return "User with email: "+email+" does not exist";
        }

        System.out.println(user.getPpCDNLink());
        if(!file.isEmpty()) {
            System.out.println("NON EMPTY PROF PIC");
            String name = file.getOriginalFilename(); //og file name

            String randomID = UUID.randomUUID().toString(); //generates randome string

            String randomizedImageName = randomID.concat(name.substring(name.lastIndexOf("."))); //combines random string w/ .*

            try {
                ObjectMetadata objectMetadata = new ObjectMetadata();
                objectMetadata.setContentType(file.getContentType());
                space.putObject(new PutObjectRequest("termitearchive", randomizedImageName, file.getInputStream(), objectMetadata).withCannedAcl(CannedAccessControlList.PublicRead));
            } catch (IOException e) {
                throw new RuntimeException(e);
            }

            user.setPpCDNLink("https://termitearchive.nyc3.cdn.digitaloceanspaces.com/"+randomizedImageName);
        }
        else {
            System.out.println("EMPTY PROF PIC");
            user.setPpCDNLink("https://termitearchive.nyc3.cdn.digitaloceanspaces.com/standard.jpg");
        }
        userRepo.save(user);

        return "Image uploaded successfully";
    }

    //we dont need a get method to retrieve images from the space because the images are stored in the user itsself as
    //the name of the key(file name) however, you SHOULD randomize the name of the key just like how you did in dev when
    //images were saved on local machine
}
