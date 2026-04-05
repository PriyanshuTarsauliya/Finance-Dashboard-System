package com.financeboard.mapper;

import com.financeboard.dto.RecordResponse;
import com.financeboard.entity.FinancialRecord;
import com.financeboard.entity.User;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-04-05T14:51:54+0530",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 23.0.1 (Oracle Corporation)"
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
        recordResponse.id( record.getId() );
        recordResponse.amount( record.getAmount() );
        recordResponse.type( record.getType() );
        recordResponse.category( record.getCategory() );
        recordResponse.date( record.getDate() );
        recordResponse.notes( record.getNotes() );
        recordResponse.createdAt( record.getCreatedAt() );
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
