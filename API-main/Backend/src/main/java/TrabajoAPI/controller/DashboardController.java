package TrabajoAPI.controller;

import TrabajoAPI.dto.Productoresponse;
import TrabajoAPI.service.Productoservice;
import TrabajoAPI.service.Usuarioservice;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    private final Productoservice productoService;
    private final Usuarioservice usuarioService;

    public DashboardController(Productoservice productoService, Usuarioservice usuarioService) {
        this.productoService = productoService;
        this.usuarioService = usuarioService;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> obtenerEstadisticas() {
        var productos = productoService.obtenerTodos();
        var usuarios = usuarioService.obtenerTodos();

        // 1. Alertas de bajo stock (< 10 unidades)
        List<Productoresponse> productosBajoStock = productos.stream()
                .filter(p -> p.getStock() < 10)
                .collect(Collectors.toList());

        // 2. Actividad reciente (Los últimos 3 agregados)
        List<Productoresponse> actividadReciente = productos.stream()
                .skip(Math.max(0, productos.size() - 3))
                .collect(Collectors.toList());
        Collections.reverse(actividadReciente);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalProductos", productos.size());
        stats.put("bajoStockCount", productosBajoStock.size());
        stats.put("totalUsuarios", usuarios.size());
        stats.put("listaBajoStock", productosBajoStock);
        stats.put("actividadReciente", actividadReciente);

        return ResponseEntity.ok(stats);
    }
}