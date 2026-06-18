if (!Array.prototype.includes) {
    Array.prototype.includes = function (searchElement: any, fromIndex?: number): boolean {
        for (let i = fromIndex ?? 0; i < this.length; i++) {
            if (this[i] === searchElement) return true;
        }

        return false;
    }
}