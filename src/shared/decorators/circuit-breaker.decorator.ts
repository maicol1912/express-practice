import CircuitBreaker from 'opossum';

const circuitBreakers = new Map<string, CircuitBreaker>();

export interface CircuitBreakerOptions {
  timeout?: number;
  errorThresholdPercentage?: number;
  resetTimeout?: number;
  fallback?: (...args: any[]) => any;
}

export function CircuitBreakerDecorator(name: string, options: CircuitBreakerOptions = {}) {
  return function (
    _target: any,
    _propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      let breaker = circuitBreakers.get(name);

      if (!breaker) {
        breaker = new CircuitBreaker(originalMethod.bind(this), {
          timeout: options.timeout || 3000,
          errorThresholdPercentage: options.errorThresholdPercentage || 50,
          resetTimeout: options.resetTimeout || 30000,
        });

        if (options.fallback) {
          breaker.fallback(options.fallback);
        }

        circuitBreakers.set(name, breaker);
      }

      return breaker.fire(...args);
    };

    return descriptor;
  };
}
