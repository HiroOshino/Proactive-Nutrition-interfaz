package TrabajoAPI.service;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

import TrabajoAPI.dto.UsuarioRequisitos;
import TrabajoAPI.dto.Usuarioresponse;
import TrabajoAPI.exception.Badrequestexception;
import TrabajoAPI.exception.Resourcenotfoundexception;
import TrabajoAPI.model.Usuario;
import TrabajoAPI.repository.Usuariorepository;

@Service
public class Usuarioservice {

    private Usuariorepository usuarioRepository;

    public Usuarioservice(Usuariorepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public Usuarioresponse crear(UsuarioRequisitos request) {
        if (usuarioRepository.existeEmail(request.getEmail())) {
            throw new Badrequestexception("Ya existe un usuario con ese email");
        }

        validarRol(request.getRol());

        if (request.getPassword() == null || request.getPassword().trim().length() < 8) {
            throw new Badrequestexception("La contraseña debe tener un mínimo de 8 caracteres.");
        }

        Usuario usuario = new Usuario();
        usuario.setNombre(request.getNombre());
        usuario.setEmail(request.getEmail());
        usuario.setPassword(request.getPassword().trim());
        usuario.setRol(request.getRol());
        usuario.setActivo(true);

        usuarioRepository.guardar(usuario);

        return convertirAResponse(usuario);
    }

    public List<Usuarioresponse> obtenerTodos() {
        List<Usuario> usuarios = usuarioRepository.buscarTodos();
        List<Usuarioresponse> respuesta = new ArrayList<>();
        for (Usuario u : usuarios) {
            respuesta.add(convertirAResponse(u));
        }
        return respuesta;
    }

    public Usuarioresponse obtenerPorId(Long id) {
        Usuario usuario = usuarioRepository.buscarPorId(id);
        if (usuario == null) {
            throw new Resourcenotfoundexception("Usuario no encontrado");
        }
        return convertirAResponse(usuario);
    }

    // admin edit
    public Usuarioresponse actualizar(Long id, UsuarioRequisitos request) {
        Usuario usuario = usuarioRepository.buscarPorId(id);
        if (usuario == null) {
            throw new Resourcenotfoundexception("Usuario no encontrado");
        }

        if (usuarioRepository.existeEmailEnOtroUsuario(request.getEmail(), id)) {
            throw new Badrequestexception("Ya existe un usuario con ese email");
        }

        validarRol(request.getRol());

        usuario.setNombre(request.getNombre());
        usuario.setEmail(request.getEmail());
        usuario.setRol(request.getRol());

        usuarioRepository.guardar(usuario);

        return convertirAResponse(usuario);
    }

    public void eliminar(Long id) {
        Usuario usuario = usuarioRepository.buscarPorId(id);
        if (usuario == null) {
            throw new Resourcenotfoundexception("Usuario no encontrado");
        }
        usuarioRepository.eliminar(id);
    }

    // login
    public Usuarioresponse autenticar(String email, String password) {
        Usuario usuario = usuarioRepository.buscarPorEmail(email);

        if (usuario == null) {
            throw new Badrequestexception("Error: El correo electrónico no está registrado.");
        }

        if (usuario.getPassword() == null || !usuario.getPassword().equals(password)) {
            throw new Badrequestexception("Error: Contraseña incorrecta. Inténtalo de nuevo.");
        }

        return convertirAResponse(usuario);
    }

    // clave olvidada jijo
    public void recuperarPassword(String email) {
        Usuario usuario = usuarioRepository.buscarPorEmail(email);
        if (usuario == null) {
            throw new Resourcenotfoundexception("El correo electrónico proporcionado no está registrado.");
        }
        System.out.println("Simulando envío de código de recuperación al correo: " + email);
    }

    private Usuarioresponse convertirAResponse(Usuario usuario) {
        Usuarioresponse response = new Usuarioresponse();
        response.setId(usuario.getId());
        response.setNombre(usuario.getNombre());
        response.setEmail(usuario.getEmail());
        response.setRol(usuario.getRol());
        response.setActivo(usuario.isActivo());
        return response;
    }

    private void validarRol(String rol) {
        if (rol == null) {
            throw new Badrequestexception("El rol no puede ser nulo.");
        }
        String rolLimpio = rol.replace(" ", "").toLowerCase();
        if (!rolLimpio.equals("admin") && !rolLimpio.equals("empleado")) {
            throw new Badrequestexception("Error: El rol debe ser 'Admin' o 'Empleado'. No se permiten otros rangos.");
        }
    }
}