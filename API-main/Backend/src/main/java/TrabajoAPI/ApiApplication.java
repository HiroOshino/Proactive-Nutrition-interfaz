package TrabajoAPI;

import TrabajoAPI.model.Producto;
import TrabajoAPI.model.Usuario;
import TrabajoAPI.repository.Productorepository;
import TrabajoAPI.repository.Usuariorepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class ApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(ApiApplication.class, args);
    }

    @Bean
    public CommandLineRunner initDatabase(Productorepository productoRepo, Usuariorepository usuarioRepo) {
        return args -> {

            // sembrado de users
            if (usuarioRepo.buscarTodos().isEmpty()) {

                Usuario u1 = new Usuario();
                u1.setNombre("Juan Sebastian Perez Poveda");
                u1.setEmail("daneivid212@gmail.com");
                u1.setPassword("whitezunder159"); // Password requerido por tu modelo
                u1.setRol("Admin");
                u1.setActivo(true);
                usuarioRepo.guardar(u1);

                System.out.println("Usuarios registrados.");
            }

            // --- SEMBRADO DE PRODUCTOS (SEGÚN TU MOCKUP) ---
            if (productoRepo.buscarTodos().isEmpty()) {

                Producto p1 = new Producto();
                p1.setNombre("Balón de Futbol Profesional");
                p1.setDescripcion("Futbol");
                p1.setPrecio(85000.0);
                p1.setStock(40);
                p1.setDisponible(true);
                productoRepo.guardar(p1);

                Producto p2 = new Producto();
                p2.setNombre("Balón de baloncesto");
                p2.setDescripcion("Baloncesto");
                p2.setPrecio(95000.0);
                p2.setStock(15);
                p2.setDisponible(true);
                productoRepo.guardar(p2);

                Producto p3 = new Producto();
                p3.setNombre("Zapatillas Running pro");
                p3.setDescripcion("Calzado");
                p3.setPrecio(320000.0);
                p3.setStock(20);
                p3.setDisponible(true);
                productoRepo.guardar(p3);

                Producto p4 = new Producto();
                p4.setNombre("Raqueta de Tenis");
                p4.setDescripcion("Tenis");
                p4.setPrecio(250000.0);
                p4.setStock(8);
                p4.setDisponible(true);
                productoRepo.guardar(p4);

                Producto p5 = new Producto();
                p5.setNombre("Pesas de Gimnasio");
                p5.setDescripcion("Fitnnes");
                p5.setPrecio(18000.0);
                p5.setStock(17);
                p5.setDisponible(true);
                productoRepo.guardar(p5);

                Producto p6 = new Producto();
                p6.setNombre("Proteina en Polvo whey pure 5LB");
                p6.setDescripcion("Fitnnes-Nutricion");
                p6.setPrecio(420000.0);
                p6.setStock(27);
                p6.setDisponible(true);
                productoRepo.guardar(p6);

                Producto p7 = new Producto();
                p7.setNombre("Creatina monohidrato dragon pharma 1kg");
                p7.setDescripcion("Fitnnes-Nutricion");
                p7.setPrecio(280000.0);
                p7.setStock(0);
                p7.setDisponible(false);
                productoRepo.guardar(p7);

                Producto p8 = new Producto();
                p8.setNombre("Guante de Beisbol");
                p8.setDescripcion("Beisbol");
                p8.setPrecio(125000.0);
                p8.setStock(5);
                p8.setDisponible(true);
                productoRepo.guardar(p8);

                Producto p9 = new Producto();
                p9.setNombre("Red de voleibol");
                p9.setDescripcion("Voleibol");
                p9.setPrecio(150000.0);
                p9.setStock(20);
                p9.setDisponible(true);
                productoRepo.guardar(p9);

                System.out.println("Inventario Exitoso.");
            }
        };
    }
}