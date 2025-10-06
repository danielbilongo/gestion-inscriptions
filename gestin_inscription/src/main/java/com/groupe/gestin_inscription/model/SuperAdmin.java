package com.groupe.gestin_inscription.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("SUPER_ADMIN")
public class SuperAdmin extends Administrator {
    // SuperAdmin-specific methods, e.g.,
    public void manageAgent(Agent agent) {
        // logic for managing other administrators
    }

}
