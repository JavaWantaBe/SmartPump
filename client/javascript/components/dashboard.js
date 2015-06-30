const React = require("react" ),
      AreaChart = require("react-d3").AreaChart;

const Dashboard = React.createClass({

    getInitialState: function() {
        return {
            areaData: []
        }
    },

    componentWillMount: function() {
        /*
         d3.json( "data/stackedAreaData.json", function ( error, data ) {
         this.setState( {areaData: data} );
         }.bind( this ) );
         */
        console.log("componentWillMount called");
    },

    render: function() {
        return (
            <div className='dashboard'>
                <AreaChart
                    data={this.state.areaData}
                    width="100%"
                    viewBoxObject={{
                        x: 0,
                        y: 0,
                        height: 500,
                        width: 600
                    }}
                    height={500}
                    title="Pumping History"
                    xAxisTickInterval={{unit: 'Month', interval: 1}}
                    xAxisLabel="Month"
                    yAxisLabel="Volume"
                    xAccessor={ (d) => {
                            return new Date(d[0]);
                        }
                    }
                    yAccessor={ (d) => d[1] }
                    />
            </div>
        );
    }
});

module.exports = Dashboard;