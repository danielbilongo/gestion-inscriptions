package com.groupe.gestin_inscription.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("AGENT")
public class Agent extends Administrator {
    // Agent-specific methods, e.g.,
    public void reviewDocument(Document document) {
        // logic for manual document validation
    }
}
