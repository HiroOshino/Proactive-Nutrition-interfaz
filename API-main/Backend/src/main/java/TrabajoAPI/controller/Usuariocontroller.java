package TrabajoAPI.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

import TrabajoAPI.dto.UsuarioRequisitos;
import TrabajoAPI.dto.Usuarioresponse;
import TrabajoAPI.service.Usuarioservice;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class Usuariocontroller {

    private Usuarioservice usuarioService;

    public Usuariocontroller(Usuarioservice usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping
    public ResponseEntity<Usuarioresponse> crear(@Valid @RequestBody UsuarioRequisitos request) {
        Usuarioresponse response = usuarioService.crear(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credenciales) {
        String email = credenciales.get("email");
        String password = credenciales.get("password");

        try {
            Usuarioresponse response = usuarioService.autenticar(email, password);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    // olvidar pasword jijooo
    @PostMapping("/recuperar")
    public ResponseEntity<?> recuperarPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        try {
            usuarioService.recuperarPassword(email);
            return ResponseEntity.ok(Map.of("message", "Si el correo existe, se han enviado las instrucciones."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<Usuarioresponse>> obtenerTodos() {
        List<Usuarioresponse> lista = usuarioService.obtenerTodos();
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Usuarioresponse> obtenerPorId(@PathVariable Long id) {
        Usuarioresponse response = usuarioService.obtenerPorId(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Usuarioresponse> actualizar(@PathVariable Long id, @RequestBody UsuarioRequisitos request) {
        Usuarioresponse response = usuarioService.actualizar(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        usuarioService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}