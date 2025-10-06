package com.groupe.gestin_inscription.security.SecurityUserService;

import org.springframework.security.core.userdetails.UserDetails;

public interface UserDetailsService {

    public UserDetails loadUserByUsername();
}
