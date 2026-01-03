use clap::{Parser, Subcommand};
use colored::Colorize;
use comfy_table::presets::UTF8_FULL;
use comfy_table::*;
use serde::Deserialize;
use std::io::{self, Write};
use std::process::{Command, Stdio};

#[derive(Parser)]
#[command(name = "fleet")]
#[command(about = "Fleet Command Interface (FCI)", long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Start all services
    Launch,
    /// Stop all services
    Land,
    /// Emergency stop
    Abort,
    /// Stop and remove volumes (Data Wipe)
    Nuke,
    /// View system status
    Status {
        #[arg(short, long)]
        tui: bool,
    },
    /// Run tests
    Test {
        #[arg(value_enum)]
        target: TestTarget,
    },
    /// Restart a service
    Restart {
        service: Option<String>,
    },
    /// Tail logs
    Logs {
        service: Option<String>,
    },
    /// Open shell in container
    Shell {
        service: String,
    },
    /// Run cargo check/clippy
    Check {
        #[arg(value_enum)]
        target: CheckTarget,
    },
    /// Scale a service
    Scale {
        service: String,
        replicas: u32,
    },
    /// List all containers (global)
    List,
}

#[derive(clap::ValueEnum, Clone)]
enum TestTarget {
    Backend,
    Frontend,
}

#[derive(clap::ValueEnum, Clone)]
enum CheckTarget {
    Backend,
}

#[derive(Deserialize, Debug)]
#[allow(dead_code)]
struct DockerContainer {
    #[serde(rename = "Name")]
    name: String,
    #[serde(rename = "Service")]
    service: String,
    #[serde(rename = "State")]
    state: String,
    #[serde(rename = "Status")]
    status: String,
    #[serde(rename = "Ports")]
    ports: Option<String>,
    #[serde(rename = "Publishers")]
    publishers: Option<Vec<Publisher>>,
    #[serde(rename = "Image")]
    image: String,
}

#[derive(Deserialize, Debug)]
struct Publisher {
    #[serde(rename = "URL")]
    url: String,
    #[serde(rename = "TargetPort")]
    target_port: u16,
    #[serde(rename = "PublishedPort")]
    published_port: u16,
    #[serde(rename = "Protocol")]
    protocol: String,
}

fn run_command(cmd: &str, args: &[&str], cwd: Option<&str>) {
    let mut command = Command::new(cmd);
    command.args(args);
    if let Some(dir) = cwd {
        command.current_dir(dir);
    }

    let status = command.status().expect("Failed to execute command");
    if !status.success() {
        eprintln!("{}", "Command failed".red());
        std::process::exit(1);
    }
}

fn docker_compose(args: &[&str]) {
    let compose_file = "backend/docker-compose.yml";
    let mut full_args = vec!["docker", "compose", "-f", compose_file];
    full_args.extend_from_slice(args);
    
    // Use sudo for docker commands
    run_command("sudo", &full_args, None);
}

fn get_docker_status() -> Vec<DockerContainer> {
    let compose_file = "backend/docker-compose.yml";
    // Use sudo for docker compose ps
    let output = Command::new("sudo")
        .args(&["docker", "compose", "-f", compose_file, "ps", "--format", "json"])
        .output()
        .expect("Failed to execute docker compose ps");

    if !output.status.success() {
        return Vec::new();
    }

    let output_str = String::from_utf8_lossy(&output.stdout);
    if let Ok(containers) = serde_json::from_str::<Vec<DockerContainer>>(&output_str) {
        return containers;
    }

    // Fallback for line-delimited JSON
    let mut containers = Vec::new();
    for line in output_str.lines() {
        if let Ok(c) = serde_json::from_str::<DockerContainer>(line) {
            containers.push(c);
        }
    }
    containers
}

#[tokio::main]
async fn main() {
    let cli = Cli::parse();

    match &cli.command {
        Commands::Launch => {
            println!("{}", "Initiating launch sequence...".blue());
            docker_compose(&["up", "-d", "--build"]);
            println!("{}", "System airborne. All services operational.".green());
        }
        Commands::Land => {
            println!("{}", "Initiating landing sequence...".green());
            docker_compose(&["down"]);
            println!("{}", "System landed. Engines off.".green());
        }
        Commands::Abort => {
            println!("{}", "ABORTING!".red().bold());
            docker_compose(&["kill"]);
        }
        Commands::Nuke => {
            println!("{}", "WARNING: NUCLEAR OPTION DETECTED.".red().bold());
            print!("Are you sure you want to wipe ALL data? [y/N] ");
            io::stdout().flush().unwrap();
            let mut input = String::new();
            io::stdin().read_line(&mut input).unwrap();
            if input.trim().eq_ignore_ascii_case("y") {
                docker_compose(&["down", "-v", "--remove-orphans"]);
                println!("{}", "Ground zero established.".green());
            } else {
                println!("Nuke aborted.");
            }
        }
        Commands::Status { tui } => {
            if *tui {
                println!(
                    "{}",
                    "Starting TUI Dashboard... (Not implemented yet)".yellow()
                );
            } else {
                println!("{}", "=== SYSTEM STATUS ===".cyan().bold());
                let containers = get_docker_status();

                if containers.is_empty() {
                    println!("{}", "No active fleet services detected.".yellow());
                } else {
                    let mut table = Table::new();
                    table
                        .load_preset(UTF8_FULL)
                        .set_content_arrangement(ContentArrangement::Dynamic)
                        .set_header(vec![
                            "Service", "State", "Status", "Ports", "Image", "Type",
                        ]);

                    for c in containers {
                        let state_color = if c.state.to_lowercase().contains("running") {
                            comfy_table::Color::Green
                        } else {
                            comfy_table::Color::Red
                        };

                        let service_type = match c.service.as_str() {
                            "db" | "redis" | "minio" => "Infrastructure",
                            "backend" => "Core API",
                            "frontend" => "Interface",
                            "backend-test" => "Test Runner",
                            _ => "Auxiliary",
                        };

                        let ports = if let Some(p) = &c.ports {
                            p.clone()
                        } else if let Some(pubs) = &c.publishers {
                            pubs.iter()
                                .map(|p| format!("{}:{}->{}/{}", p.url, p.published_port, p.target_port, p.protocol))
                                .collect::<Vec<_>>()
                                .join(", ")
                        } else {
                            String::new()
                        };

                        table.add_row(vec![
                            Cell::new(&c.service).add_attribute(Attribute::Bold),
                            Cell::new(&c.state).fg(state_color),
                            Cell::new(&c.status),
                            Cell::new(&ports),
                            Cell::new(&c.image),
                            Cell::new(service_type).fg(comfy_table::Color::Cyan),
                        ]);
                    }
                    println!("{table}");
                }
            }
        }
        Commands::Test { target } => match target {
            TestTarget::Backend => {
                println!("{}", "Running Backend Diagnostics...".blue());
                
                // Check if DB is running
                let containers = get_docker_status();
                let db_running = containers.iter().any(|c| c.service == "db" && c.state.to_lowercase().contains("running"));
                
                if !db_running {
                    println!("{}", "Database not running. Starting infrastructure...".yellow());
                    docker_compose(&["up", "-d", "db", "redis", "minio"]);
                    println!("{}", "Waiting for services to stabilize...".yellow());
                    std::thread::sleep(std::time::Duration::from_secs(5));
                }

                println!("{}", "Executing tests inside container...".cyan());
                // Run tests in the backend-test container
                docker_compose(&["run", "--rm", "backend-test", "cargo", "test"]);
            }
            TestTarget::Frontend => {
                println!("{}", "Running Frontend Diagnostics...".blue());
                run_command("npm", &["test"], Some("frontend"));
            }
        },
        Commands::Restart { service } => {
            let mut args = vec!["restart"];
            if let Some(s) = service {
                args.push(s);
            }
            docker_compose(&args);
        }
        Commands::Logs { service } => {
            let mut args = vec!["logs", "-f"];
            if let Some(s) = service {
                args.push(s);
            }
            docker_compose(&args);
        }
        Commands::Shell { service } => {
            // Interactive shell requires inheriting stdio
            let compose_file = "backend/docker-compose.yml";
            let mut cmd = Command::new("sudo");
            cmd.args(&["docker", "compose", "-f", compose_file, "exec", &service, "/bin/sh", "-c", "bash || sh"]);
            cmd.stdin(Stdio::inherit())
                .stdout(Stdio::inherit())
                .stderr(Stdio::inherit());
            
            let status = cmd.status().expect("Failed to open shell");
            if !status.success() {
                eprintln!("{}", "Shell session ended with error".red());
            }
        }
        Commands::Check { target } => match target {
            CheckTarget::Backend => {
                println!("{}", "Running Pre-flight Checks...".blue());
                run_command("cargo", &["check"], Some("backend"));
                run_command("cargo", &["clippy"], Some("backend"));
            }
        },
        Commands::Scale { service, replicas } => {
            let scale_arg = format!("{}={}", service, replicas);
            docker_compose(&["up", "-d", "--scale", &scale_arg]);
        }
        Commands::List => {
            println!("{}", "Listing all containers (global)...".blue());
            run_command("sudo", &["docker", "ps", "-a"], None);
        }
    }
}
