import {
  ApiResponse,
  CpuData,
  MemoryData,
  DiskData,
  NetworkData,
  SystemInfo,
  ProcessData,
} from "@/types/api";

// 模拟 API 延迟
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 生成随机数据的工具函数
const randomBetween = (min: number, max: number) =>
  Math.random() * (max - min) + min;
const randomInt = (min: number, max: number) =>
  Math.floor(randomBetween(min, max));

// 生成历史数据
const generateHistory = (count: number = 20) => {
  const history = [];
  const now = new Date();

  for (let i = count - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 5000); // 每5秒一个数据点
    history.push({
      timestamp: timestamp.toISOString(),
      usage: randomBetween(10, 90),
    });
  }

  return history;
};

// 生成内存历史数据
const generateMemoryHistory = (count: number = 20) => {
  const history = [];
  const now = new Date();

  for (let i = count - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 5000);
    const usage_percent = randomBetween(40, 85);
    history.push({
      timestamp: timestamp.toISOString(),
      usage_percent,
      used: (usage_percent / 100) * 16, // 假设总内存16GB
    });
  }

  return history;
};

// 生成网络历史数据
const generateNetworkHistory = (count: number = 20) => {
  const history = [];
  const now = new Date();

  for (let i = count - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 5000);
    history.push({
      timestamp: timestamp.toISOString(),
      bytes_sent_per_sec: randomBetween(1024 * 100, 1024 * 1024 * 10), // 100KB - 10MB/s
      bytes_recv_per_sec: randomBetween(1024 * 500, 1024 * 1024 * 50), // 500KB - 50MB/s
    });
  }

  return history;
};

// 模拟 CPU 数据
export const fetchCpuData = async (): Promise<ApiResponse<CpuData>> => {
  await delay(randomInt(100, 300));

  const data: CpuData = {
    usage: randomBetween(15, 85),
    cores: 16,
    frequency: randomBetween(2400, 4200),
    temperature: randomBetween(35, 65),
    model: "AMD Ryzen 9 7950X",
    history: generateHistory(),
  };

  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
};

// 模拟内存数据
export const fetchMemoryData = async (): Promise<ApiResponse<MemoryData>> => {
  await delay(randomInt(100, 300));

  const total = 16;
  const used = randomBetween(6, 12);
  const free = total - used;
  const available = free + randomBetween(1, 3);

  const data: MemoryData = {
    total,
    used,
    free,
    available,
    usage_percent: (used / total) * 100,
    swap_total: 4,
    swap_used: randomBetween(0, 1),
    history: generateMemoryHistory(),
  };

  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
};

// 模拟磁盘数据
export const fetchDiskData = async (): Promise<ApiResponse<DiskData>> => {
  await delay(randomInt(100, 300));

  const disks = [
    {
      device: "/dev/nvme0n1p1",
      mount_point: "/",
      filesystem: "ext4",
      total: 500,
      used: randomBetween(200, 400),
      free: 0,
      usage_percent: 0,
    },
    {
      device: "/dev/nvme0n1p2",
      mount_point: "/home",
      filesystem: "ext4",
      total: 1000,
      used: randomBetween(300, 700),
      free: 0,
      usage_percent: 0,
    },
    {
      device: "/dev/sda1",
      mount_point: "/var",
      filesystem: "xfs",
      total: 2000,
      used: randomBetween(800, 1500),
      free: 0,
      usage_percent: 0,
    },
  ];

  // 计算空闲空间和使用率
  disks.forEach((disk) => {
    disk.free = disk.total - disk.used;
    disk.usage_percent = (disk.used / disk.total) * 100;
  });

  const data: DiskData = {
    disks,
    total_capacity: disks.reduce((sum, disk) => sum + disk.total, 0),
    total_used: disks.reduce((sum, disk) => sum + disk.used, 0),
    total_free: disks.reduce((sum, disk) => sum + disk.free, 0),
  };

  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
};

// 模拟网络数据
export const fetchNetworkData = async (): Promise<ApiResponse<NetworkData>> => {
  await delay(randomInt(100, 300));

  const interfaces = [
    {
      name: "eth0",
      bytes_sent: randomInt(1024 * 1024 * 100, 1024 * 1024 * 1000), // 100MB - 1GB
      bytes_recv: randomInt(1024 * 1024 * 500, 1024 * 1024 * 5000), // 500MB - 5GB
      packets_sent: randomInt(10000, 100000),
      packets_recv: randomInt(50000, 500000),
      speed: 1000, // 1Gbps
      is_up: true,
    },
    {
      name: "wlan0",
      bytes_sent: randomInt(1024 * 1024 * 50, 1024 * 1024 * 200),
      bytes_recv: randomInt(1024 * 1024 * 100, 1024 * 1024 * 800),
      packets_sent: randomInt(5000, 20000),
      packets_recv: randomInt(10000, 80000),
      speed: 300, // 300Mbps
      is_up: Math.random() > 0.3, // 70% 概率启用
    },
    {
      name: "lo",
      bytes_sent: randomInt(1024 * 1024 * 10, 1024 * 1024 * 50),
      bytes_recv: randomInt(1024 * 1024 * 10, 1024 * 1024 * 50),
      packets_sent: randomInt(1000, 5000),
      packets_recv: randomInt(1000, 5000),
      speed: 0, // 回环接口
      is_up: true,
    },
  ];

  const data: NetworkData = {
    interfaces,
    total_bytes_sent: interfaces.reduce(
      (sum, iface) => sum + iface.bytes_sent,
      0
    ),
    total_bytes_recv: interfaces.reduce(
      (sum, iface) => sum + iface.bytes_recv,
      0
    ),
    history: generateNetworkHistory(),
  };

  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
};

// 模拟系统信息
export const fetchSystemInfo = async (): Promise<ApiResponse<SystemInfo>> => {
  await delay(randomInt(100, 300));

  const data: SystemInfo = {
    hostname: "ubuntu-server-01",
    platform: "Linux",
    os: "Ubuntu 22.04.3 LTS",
    arch: "x86_64",
    uptime: randomInt(3600, 86400 * 30), // 1小时到30天
    boot_time: new Date(
      Date.now() - randomInt(3600000, 86400000 * 30)
    ).toISOString(),
    processes: randomInt(200, 450),
    load_average: [
      randomBetween(0.2, 1.5),
      randomBetween(0.3, 1.8),
      randomBetween(0.4, 2.2),
    ],
  };

  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
};

// 模拟进程数据
export const fetchProcessData = async (): Promise<ApiResponse<ProcessData>> => {
  await delay(randomInt(100, 300));

  const processNames = [
    "systemd",
    "kthreadd",
    "ksoftirqd/0",
    "migration/0",
    "rcu_gp",
    "rcu_par_gp",
    "kworker/0:0H",
    "mm_percpu_wq",
    "ksoftirqd/1",
    "migration/1",
    "rcu_sched",
    "watchdog/0",
    "sshd",
    "nginx",
    "mysql",
    "redis-server",
    "docker",
    "containerd",
    "node",
    "python3",
    "bash",
    "vim",
    "htop",
    "firefox",
    "code",
  ];

  const processes = processNames.map((name, index) => ({
    pid: 1000 + index * 100 + randomInt(1, 99),
    name,
    cpu_percent: randomBetween(0, 25),
    memory_percent: randomBetween(0.1, 15),
    memory_mb: randomBetween(10, 500),
    status: Math.random() > 0.1 ? "running" : "sleeping",
    create_time: new Date(
      Date.now() - randomInt(60000, 86400000)
    ).toISOString(),
    cmdline: `/usr/bin/${name}`,
  }));

  const data: ProcessData = {
    processes: processes.slice(0, 10), // 只返回前10个进程
    total_processes: processes.length,
    running_processes: processes.filter((p) => p.status === "running").length,
    sleeping_processes: processes.filter((p) => p.status === "sleeping").length,
  };

  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
};

// API 端点映射
const apiEndpoints = {
  "/api/cpu": fetchCpuData,
  "/api/memory": fetchMemoryData,
  "/api/disk": fetchDiskData,
  "/api/network": fetchNetworkData,
  "/api/system": fetchSystemInfo,
  "/api/processes": fetchProcessData,
} as const;

// 通用 API 调用函数
export const apiCall = async <T>(
  endpoint: keyof typeof apiEndpoints
): Promise<ApiResponse<T>> => {
  const apiFunction = apiEndpoints[endpoint];
  if (!apiFunction) {
    throw new Error(`Unknown API endpoint: ${String(endpoint)}`);
  }

  return apiFunction() as Promise<ApiResponse<T>>;
};
