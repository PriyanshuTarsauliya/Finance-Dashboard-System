package com.financeboard.mapper;

import com.financeboard.dto.UserResponse;
import com.financeboard.entity.User;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-04-05T15:54:24+0530",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class UserMapperImpl implements UserMapper {

    @Override
    public UserResponse toResponse(User user) {
        if ( user == null ) {
            return null;
        }

        UserResponse.UserResponseBuilder userResponse = UserResponse.builder();

        userResponse.createdAt( user.getCreatedAt() );
        userResponse.email( user.getEmail() );
        userResponse.id( user.getId() );
        userResponse.name( user.getName() );
        userResponse.role( user.getRole() );
        userResponse.status( user.getStatus() );
        userResponse.updatedAt( user.getUpdatedAt() );

        return userResponse.build();
    }
}
