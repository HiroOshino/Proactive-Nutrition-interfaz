package TrabajoAPI;

import TrabajoAPI.model.Producto;
import TrabajoAPI.repository.Productorepository;
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
    public CommandLineRunner initDatabase(Productorepository repository) {
        return args -> {
            Producto p1 = new Producto();
            p1.setNombre("Zapatillas Nike");
            p1.setPrecio(1200.0);
            p1.setStock(10);
            p1.setDisponible(true);
            p1.setDescripcion("Zapatillas deportivas");

            Producto p2 = new Producto();
            p2.setNombre("Balon de futbol");
            p2.setPrecio(25000.0);
            p2.setStock(5);
            p2.setDisponible(true);
            p2.setDescripcion("futbol");

            repository.guardar(p1);
            repository.guardar(p2);
        };
    }
}
