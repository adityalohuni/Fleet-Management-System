use fleet_management_backend::api_docs::ApiDoc;
use utoipa::OpenApi;
use std::fs::File;
use std::io::Write;

fn main() {
    let openapi = ApiDoc::openapi();
    let json = openapi.to_json().expect("Failed to convert to JSON");
    
    let mut file = File::create("../frontend/openapi.json").expect("Failed to create file");
    file.write_all(json.as_bytes()).expect("Failed to write to file");
    
    println!("OpenAPI spec generated at ../frontend/openapi.json");
}
