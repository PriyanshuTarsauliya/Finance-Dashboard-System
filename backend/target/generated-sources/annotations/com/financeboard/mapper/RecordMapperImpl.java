package com.financeboard.mapper;

import com.financeboard.dto.RecordResponse;
import com.financeboard.entity.FinancialRecord;
import com.financeboard.entity.User;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-04-06T02:00:42+0530",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class RecordMapperImpl implements RecordMapper {

    @Override
    public RecordResponse toResponse(FinancialRecord record) {
        if ( record == null ) {
            return null;
        }

        RecordResponse.RecordResponseBuilder recordResponse = RecordResponse.builder();

        recordResponse.createdById( recordCreatedById( record ) );
        recordResponse.createdByName( recordCreatedByName( record ) );
        recordResponse.amount( record.getAmount() );
        recordResponse.category( record.getCategory() );
        recordResponse.createdAt( record.getCreatedAt() );
        recordResponse.date( record.getDate() );
        recordResponse.id( record.getId() );
        recordResponse.notes( record.getNotes() );
        recordResponse.type( record.getType() );
        recordResponse.updatedAt( record.getUpdatedAt() );

        return recordResponse.build();
    }

    private UUID recordCreatedById(FinancialRecord financialRecord) {
        if ( financialRecord == null ) {
            return null;
        }
        User createdBy = financialRecord.getCreatedBy();
        if ( createdBy == null ) {
            return null;
        }
        UUID id = createdBy.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String recordCreatedByName(FinancialRecord financialRecord) {
        if ( financialRecord == null ) {
            return null;
        }
        User createdBy = financialRecord.getCreatedBy();
        if ( createdBy == null ) {
            return null;
        }
        String name = createdBy.getName();
        if ( name == null ) {
            return null;
        }
        return name;
    }
}
