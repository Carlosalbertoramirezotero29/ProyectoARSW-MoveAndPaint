/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.escuelaing.arsw.msgbroker.test;

import com.escuelaing.arsw.msgbroker.model.Jugador;
import com.escuelaing.arsw.msgbroker.security.HashSalt;
import com.escuelaing.arsw.msgbroker.security.PasswordUtil;
import com.escuelaing.arsw.msgbroker.services.MoveAndPaintRegisterServicesStub;
import com.escuelaing.arsw.msgbroker.services.ServicesException;
import java.util.logging.Level;
import java.util.logging.Logger;
import static org.junit.Assert.assertEquals;
import org.junit.Before;
import org.junit.Test;

/**
 * @author Carlos Alberto Ramirez Otero CONDICION DE ENTRADA | TIPO | CLASE DE
 * EQUIVALENCIA VÁLIDA | CLASE DE EQUIVALENCIA NO VALIDA Registrar los datos de
 * un jugador | | | con usuario y correo no usado por | Verificación | Ingresar
 * un jugador con usuario y correo que aún | No permitir el registro del usuario
 * por datos otro jugador. | | no ha sido registrado antes. | ya existentes.
 *
 * CE1: Se desea registrar un usuario con nombre ya usado por otro jugador. Se
 * desea registrar un usuario con email ya usado por otro jugador. Se agregará
 * un usuario con datos nuevos no registrados en el sistema
 *
 */
public class MoveAndPaintRegisterTest {
    private MoveAndPaintRegisterServicesStub registerTest;
    
    @Before
    public void setUp() throws Exception {
        registerTest = new MoveAndPaintRegisterServicesStub();
    }

    @Test
    public void CE1() throws ServicesException, Exception {
        HashSalt hs = PasswordUtil.getHash("asd");
        String pass = hs.getHash() + hs.getSalt();
        Jugador j1 = new Jugador(0, 0, null, "carlitos", "carlitos@mail.com",false, pass, hs.getSalt());
        Jugador j2 = new Jugador(0, 0, null, "mateoxd", "mateo@mail.com",false, pass, hs.getSalt());
        Jugador j3 = new Jugador(0, 0, null, "Leonardo", "leonardo@mail.com",false, pass, hs.getSalt());
        try {
            registerTest.registerPlayer(j1);
            registerTest.registerPlayer(j2);
        } catch (ServicesException ex) {
            Logger.getLogger(MoveAndPaintRegisterTest.class.getName()).log(Level.SEVERE, null, ex.getMessage());
        }
        assertEquals("Deberian haber 5 jugadores registrados", registerTest.getPlayersRegistered().size(), 5);
        registerTest.registerPlayer(j3);
        assertEquals("Deberian haber 6 jugadores registrados", registerTest.getPlayersRegistered().size(), 6);

    }
}
