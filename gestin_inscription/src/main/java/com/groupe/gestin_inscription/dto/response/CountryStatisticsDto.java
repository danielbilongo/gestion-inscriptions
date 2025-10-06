package com.groupe.gestin_inscription.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CountryStatisticsDto {
    private String country;
    private String countryCode;
    private Long count;
    private Double percentage;
}
