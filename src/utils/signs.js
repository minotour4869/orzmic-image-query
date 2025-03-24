export const signs = {
	Info: '[\x1b[36mi\x1b[0m] %s',
	Warning: '[\x1b[33m⚠\x1b[0m] %s',
	Error: '[\x1b[31mx\x1b[0m] %s'
}

export const logType = Object.freeze({
    INFO: {value: 0, icon: ""},
    WARNING: {value: 1, icon: ":warning:"},
    ERROR: {value: 2, icon: ":x:"},
})
