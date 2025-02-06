import { QueryClient } from "@tanstack/react-query";
import {
	RouterProvider,
	createMemoryHistory,
	createRootRoute,
	createRouter,
} from "@tanstack/react-router";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FlowRunActivityBarChart } from "./index";

const mockFlowRun = {
	id: "test-flow-run-1",
	name: "Test Flow Run",
	state_type: "COMPLETED",
	state: {
		type: "COMPLETED",
		name: "Completed",
	},
	start_time: "2024-01-01T00:00:00.000Z",
	total_run_time: 3600,
	tags: ["test-tag"],
	deployment: {
		id: "test-deployment-1",
		name: "Test Deployment",
	},
	flow: {
		id: "test-flow-1",
		name: "Test Flow",
	},
};

const mockEnrichedFlowRuns = [mockFlowRun];

describe("FlowRunActivityBarChart", () => {
	const defaultProps = {
		enrichedFlowRuns: mockEnrichedFlowRuns,
		startDate: new Date("2024-01-01"),
		endDate: new Date("2024-01-02"),
		numberOfBars: 24,
	};

	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("shows tooltip on bar hover", () => {
		const rootRoute = createRootRoute({
			component: () => (
				// @ts-expect-error - Type error from test data not matching schema
				<FlowRunActivityBarChart {...defaultProps} numberOfBars={1} />
			),
		});
		const router = createRouter({
			routeTree: rootRoute,
			history: createMemoryHistory({
				initialEntries: ["/"],
			}),
			context: {
				queryClient: new QueryClient(),
			},
		});

		// @ts-expect-error - Type error from using a test router
		render(<RouterProvider router={router} />);

		const bar = screen.getByTestId("bar-rect-test-flow-run-1");
		fireEvent.mouseOver(bar);

		// Check if tooltip content appears
		expect(screen.getByText("Test Flow")).toBeInTheDocument();
		expect(screen.getByText("Test Flow Run")).toBeInTheDocument();
		expect(screen.getByText("Test Deployment")).toBeInTheDocument();
		// Check if state badge is rendered
		expect(screen.getByText("Completed")).toBeInTheDocument();
		// Check if tags are rendered
		expect(screen.getByText("test-tag")).toBeInTheDocument();
	});

	it("renders correct number of bars", () => {
		const { rerender } = render(
			/* @ts-expect-error - Type error from test data not matching schema */
			<FlowRunActivityBarChart {...defaultProps} />,
		);

		let bars = screen.getAllByRole("graphics-symbol");
		expect(bars).toHaveLength(defaultProps.numberOfBars);

		rerender(
			/* @ts-expect-error - Type error from test data not matching schema */
			<FlowRunActivityBarChart {...defaultProps} numberOfBars={10} />,
		);

		bars = screen.getAllByRole("graphics-symbol");
		expect(bars).toHaveLength(10);
	});

	it.each([
		["COMPLETED", "fill-green-600"],
		["FAILED", "fill-red-600"],
		["CANCELLED", "fill-gray-500"],
		["CANCELLING", "fill-gray-600"],
		["PENDING", "fill-gray-400"],
		["SCHEDULED", "fill-yellow-400"],
		["PAUSED", "fill-gray-500"],
		["RUNNING", "fill-blue-700"],
		["CRASHED", "fill-orange-600"],
	])(
		"renders the bars with expected colors for %s",
		(stateType, expectedClass) => {
			const enrichedFlowRun = {
				...mockFlowRun,
				state_type: stateType,
			};
			render(
				<FlowRunActivityBarChart
					{...defaultProps}
					// @ts-expect-error - Type error from test data not matching schema
					enrichedFlowRuns={[enrichedFlowRun]}
				/>,
			);
			const bars = screen.getAllByRole("graphics-symbol");
			expect(
				within(bars[0]).getByTestId("bar-rect-test-flow-run-1"),
			).toHaveClass(expectedClass);
		},
	);

	it("applies custom bar width when provided", () => {
		const customBarWidth = 12;
		render(
			/* @ts-expect-error - Type error from test data not matching schema */
			<FlowRunActivityBarChart {...defaultProps} barWidth={customBarWidth} />,
		);

		const bar = screen.getByTestId("bar-rect-test-flow-run-1");
		expect(bar).toHaveAttribute("width", customBarWidth.toString());
	});
});
