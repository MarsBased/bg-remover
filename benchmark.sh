#!/bin/bash

# Number of requests to make
NUM_REQUESTS=1

# URL to test
URL="http://localhost:8000/remove-bg?image_url=https://e00-expansion.uecdn.es/assets/multimedia/imagenes/2021/05/19/16213755719771.jpg"

# Create results directory if it doesn't exist
mkdir -p results

# Clear previous results
rm -f results/result_*.png
rm -f results/times.txt

echo "Starting benchmark with $NUM_REQUESTS parallel requests..."
echo "Time results (in order of completion):" > results/times.txt

# Function to make a single request and measure time
make_request() {
    local i=$1
    local start_time=$(date +%s.%N)
    
    # Make the request and capture both the response and the exit status
    if curl -X POST "$URL" --output "results/result_$i.png" -s -w "\n%{http_code}"; then
        local end_time=$(date +%s.%N)
        local execution_time=$(echo "$end_time - $start_time" | bc)
        echo "$i,$execution_time" >> results/times.txt
    else
        echo "$i,ERROR" >> results/times.txt
    fi
}

# Launch all requests in parallel
for i in $(seq 1 $NUM_REQUESTS); do
    make_request $i &
done

# Wait for all background processes to complete
wait

# Calculate statistics
echo -e "\nCalculating statistics..."
total_time=0
count=0
min_time=999999
max_time=0

while IFS=',' read -r request time; do
    if [[ $time != "ERROR" ]]; then
        total_time=$(echo "$total_time + $time" | bc)
        count=$((count + 1))
        
        # Update min and max
        if (( $(echo "$time < $min_time" | bc -l) )); then
            min_time=$time
        fi
        if (( $(echo "$time > $max_time" | bc -l) )); then
            max_time=$time
        fi
    fi
done < results/times.txt

# Calculate average
if [ $count -gt 0 ]; then
    avg_time=$(echo "scale=3; $total_time / $count" | bc)
    
    echo -e "\nResults Summary:"
    echo "Total requests: $NUM_REQUESTS"
    echo "Successful requests: $count"
    echo "Average response time: ${avg_time}s"
    echo "Minimum response time: ${min_time}s"
    echo "Maximum response time: ${max_time}s"
    echo -e "\nDetailed results are in results/times.txt"
else
    echo "No successful requests to calculate statistics"
fi 