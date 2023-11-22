<?php 
class DotEnv {
    /**
     * the directory where the .env can be found
     * 
     * @var string
     */
    protected $path; 

    public function __construct(string $path) {
        if (!file_exists($path)) {
            throw new \InvalidArgumentException(sprintf('%s does not exists', $path)); 
        }
        $this->path = $path; 
    }

    public function load() {
        if (!is_readable($this->path)) {
            throw new \RuntimeException(sprintf('%s file not readable', $this->path)); 
        }

        $lines = file($this->path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES); 

        foreach($lines as $line) {
            if (strpos(trim($line), '#') === 0) {
                continue; 
            }

            list($name, $value) = explode('=', $line, 2); 
            $name = trim($name); 
            $value = trim($value); 

            if (!array_key_exists($name, $_SERVER) && !array_key_exists($name, $_ENV)) {
                putenv(sprintf('%s=%s', $name, $value)); 
                $_ENV[$name] = $value; 
                $_SERVER[$name] = $value; 
            }
        }

        return $this; 
    }

    public function demo($key) {
        echo '<pre>'; 
        echo getenv($key); 
        echo '<br/>'; 
        echo $_ENV[$key]; 
        echo '<br/>'; 
        echo $_SERVER[$key]; 
        echo '<br/>'; 
        return $this; 
    }
}